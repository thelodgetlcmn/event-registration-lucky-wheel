var CONFIG = Object.freeze({
  SHEET_NAME: "Registrations",
  HEADERS: ["Timestamp", "First Name", "Last Name", "UUID", "Status", "Winner"],
  STATUS_AVAILABLE: "AVAILABLE",
  STATUS_WINNER: "WINNER",
  MAX_NAME_LENGTH: 60,
  MAX_IMPORT_ROWS: 500,
  RATE_LIMIT_WINDOW_SECONDS: 60,
  RATE_LIMIT_MAX_REQUESTS: 5,
});

function doGet(e) {
  return handleJson_(function () {
    var params = (e && e.parameter) || {};
    assertSecret_(params.secret);

    var action = String(params.action || "health");
    if (action === "list") {
      return jsonResponse_(true, "Success", listRegistrants_(), null, 200);
    }

    if (action === "winners") {
      return jsonResponse_(true, "Success", listWinners_(), null, 200);
    }

    if (action === "health") {
      return jsonResponse_(true, "OK", healthCheck(), null, 200);
    }

    throw httpError_("Unknown action", 400);
  });
}

function doPost(e) {
  return handleJson_(function () {
    var payload = parseBody_(e);
    assertSecret_(payload.secret);

    if (payload.action === "register") {
      return jsonResponse_(true, "Registered", register_(payload), null, 201);
    }

    if (payload.action === "drawWinner") {
      return jsonResponse_(true, "Winner selected", drawWinner_(), null, 200);
    }

    if (payload.action === "removeWinner") {
      return jsonResponse_(true, "Winner selected", removeWinner(payload.uuid), null, 200);
    }

    if (payload.action === "reset") {
      return jsonResponse_(true, "Database reset", resetData(), null, 200);
    }

    if (payload.action === "import") {
      return jsonResponse_(true, "Import completed", importRows_(payload.rows), null, 200);
    }

    throw httpError_("Unknown action", 400);
  });
}

function doOptions() {
  return jsonResponse_(true, "OK", {}, null, 200);
}

function healthCheck() {
  var sheet = getSheet_();
  return {
    sheetName: sheet.getName(),
    totalRows: Math.max(0, sheet.getLastRow() - 1),
    timestamp: new Date().toISOString(),
  };
}

function removeWinner(uuid) {
  if (!uuid) {
    throw httpError_("UUID is required", 422);
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    var sheet = getSheet_();
    var row = findRowByUuid_(sheet, String(uuid));

    if (!row) {
      throw httpError_("Registrant not found", 404);
    }

    if (row.record.status === CONFIG.STATUS_WINNER || row.record.winner === true) {
      throw httpError_("Registrant is already a winner", 409);
    }

    return markWinner_(sheet, row.rowNumber);
  } finally {
    lock.releaseLock();
  }
}

function resetData() {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    var sheet = getSheet_();
    var lastRow = sheet.getLastRow();
    var cleared = Math.max(0, lastRow - 1);

    if (cleared > 0) {
      sheet.getRange(2, 1, cleared, CONFIG.HEADERS.length).clearContent();
    }

    return { cleared: cleared };
  } finally {
    lock.releaseLock();
  }
}

function register_(payload) {
  var firstName = validateName_(payload.firstName, "First Name");
  var lastName = validateName_(payload.lastName, "Last Name");
  var requestKey = payload.clientRequestId || firstName + ":" + lastName;

  enforceRateLimit_(String(requestKey));

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    var sheet = getSheet_();

    if (isDuplicate_(sheet, firstName, lastName)) {
      throw httpError_("Duplicate registration", 409);
    }

    var timestamp = new Date();
    var uuid = Utilities.getUuid();
    var row = [
      timestamp,
      escapeSheetFormula_(firstName),
      escapeSheetFormula_(lastName),
      uuid,
      CONFIG.STATUS_AVAILABLE,
      false,
    ];

    sheet.appendRow(row);

    return {
      timestamp: timestamp.toISOString(),
      firstName: firstName,
      lastName: lastName,
      uuid: uuid,
      status: CONFIG.STATUS_AVAILABLE,
      winner: false,
    };
  } finally {
    lock.releaseLock();
  }
}

function drawWinner_() {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    var sheet = getSheet_();
    var rows = getRows_(sheet);
    var availableRows = rows.filter(function (row) {
      return row.record.status === CONFIG.STATUS_AVAILABLE && row.record.winner !== true;
    });

    if (availableRows.length === 0) {
      throw httpError_("No available registrants", 404);
    }

    var selected = availableRows[Math.floor(Math.random() * availableRows.length)];
    return markWinner_(sheet, selected.rowNumber);
  } finally {
    lock.releaseLock();
  }
}

function importRows_(rows) {
  if (!Array.isArray(rows)) {
    throw httpError_("Rows must be an array", 422);
  }

  if (rows.length < 1 || rows.length > CONFIG.MAX_IMPORT_ROWS) {
    throw httpError_("Import rows must be between 1 and " + CONFIG.MAX_IMPORT_ROWS, 422);
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    var sheet = getSheet_();
    var existing = buildExistingNameMap_(sheet);
    var values = [];
    var skipped = 0;
    var errors = [];

    rows.forEach(function (row, index) {
      try {
        var firstName = validateName_(row.firstName, "First Name");
        var lastName = validateName_(row.lastName, "Last Name");
        var key = nameKey_(firstName, lastName);

        if (existing[key]) {
          skipped += 1;
          return;
        }

        existing[key] = true;
        values.push([
          new Date(),
          escapeSheetFormula_(firstName),
          escapeSheetFormula_(lastName),
          Utilities.getUuid(),
          CONFIG.STATUS_AVAILABLE,
          false,
        ]);
      } catch (error) {
        errors.push("Row " + (index + 2) + ": " + getMessage_(error));
      }
    });

    if (values.length > 0) {
      sheet
        .getRange(sheet.getLastRow() + 1, 1, values.length, CONFIG.HEADERS.length)
        .setValues(values);
    }

    return {
      inserted: values.length,
      skipped: skipped,
      errors: errors,
    };
  } finally {
    lock.releaseLock();
  }
}

function listRegistrants_() {
  return getRows_(getSheet_()).map(function (row) {
    return row.record;
  });
}

function listWinners_() {
  return listRegistrants_().filter(function (record) {
    return record.status === CONFIG.STATUS_WINNER || record.winner === true;
  });
}

function markWinner_(sheet, rowNumber) {
  sheet.getRange(rowNumber, 5).setValue(CONFIG.STATUS_WINNER);
  sheet.getRange(rowNumber, 6).setValue(true);
  SpreadsheetApp.flush();

  var values = sheet.getRange(rowNumber, 1, 1, CONFIG.HEADERS.length).getValues()[0];
  return valuesToRegistrant_(values);
}

function findRowByUuid_(sheet, uuid) {
  var rows = getRows_(sheet);
  for (var index = 0; index < rows.length; index += 1) {
    if (rows[index].record.uuid === uuid) {
      return rows[index];
    }
  }

  return null;
}

function isDuplicate_(sheet, firstName, lastName) {
  return Boolean(buildExistingNameMap_(sheet)[nameKey_(firstName, lastName)]);
}

function buildExistingNameMap_(sheet) {
  var existing = {};
  getRows_(sheet).forEach(function (row) {
    existing[nameKey_(row.record.firstName, row.record.lastName)] = true;
  });
  return existing;
}

function getRows_(sheet) {
  ensureHeaders_(sheet);
  var lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return [];
  }

  var values = sheet.getRange(2, 1, lastRow - 1, CONFIG.HEADERS.length).getValues();
  return values
    .filter(function (row) {
      return row.some(function (value) {
        return String(value).trim().length > 0;
      });
    })
    .map(function (row, index) {
      return {
        rowNumber: index + 2,
        record: valuesToRegistrant_(row),
      };
    });
}

function valuesToRegistrant_(row) {
  return {
    timestamp: toIsoString_(row[0]),
    firstName: String(row[1] || ""),
    lastName: String(row[2] || ""),
    uuid: String(row[3] || ""),
    status: String(row[4] || CONFIG.STATUS_AVAILABLE),
    winner: toBoolean_(row[5]),
  };
}

function getSheet_() {
  var properties = PropertiesService.getScriptProperties();
  var spreadsheetId = properties.getProperty("SPREADSHEET_ID");
  var spreadsheet = spreadsheetId
    ? SpreadsheetApp.openById(spreadsheetId)
    : SpreadsheetApp.getActiveSpreadsheet();

  if (!spreadsheet) {
    throw httpError_("Spreadsheet is not configured", 500);
  }

  var sheet =
    spreadsheet.getSheetByName(CONFIG.SHEET_NAME) || spreadsheet.insertSheet(CONFIG.SHEET_NAME);
  ensureHeaders_(sheet);
  return sheet;
}

function ensureHeaders_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(CONFIG.HEADERS);
    sheet.setFrozenRows(1);
    return;
  }

  var current = sheet.getRange(1, 1, 1, CONFIG.HEADERS.length).getValues()[0];
  var shouldRewrite = CONFIG.HEADERS.some(function (header, index) {
    return current[index] !== header;
  });

  if (shouldRewrite) {
    sheet.getRange(1, 1, 1, CONFIG.HEADERS.length).setValues([CONFIG.HEADERS]);
  }

  sheet.setFrozenRows(1);
}

function validateName_(value, label) {
  if (typeof value !== "string") {
    throw httpError_(label + " must be text", 422);
  }

  var normalized = normalize_(value);
  if (normalized.length === 0) {
    throw httpError_(label + " is required", 422);
  }

  if (normalized.length > CONFIG.MAX_NAME_LENGTH) {
    throw httpError_(label + " is too long", 422);
  }

  if (/[<>]/.test(value)) {
    throw httpError_(label + " cannot contain HTML", 422);
  }

  if (
    /--|;|\/\*|\*\/|\b(select|insert|update|delete|drop|alter|truncate|union|exec)\b/i.test(value)
  ) {
    throw httpError_(label + " contains unsafe input", 422);
  }

  if (!/^[\p{L}\p{M}\s.'-]+$/u.test(normalized)) {
    throw httpError_(label + " contains unsupported characters", 422);
  }

  return normalized;
}

function normalize_(value) {
  return String(value)
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeSheetFormula_(value) {
  return /^[=+\-@\t\r]/.test(value) ? "'" + value : value;
}

function nameKey_(firstName, lastName) {
  return normalize_(firstName + " " + lastName).toLowerCase();
}

function enforceRateLimit_(key) {
  var cache = CacheService.getScriptCache();
  var cacheKey = "rate:" + digest_(key);
  var current = Number(cache.get(cacheKey) || "0");

  if (current >= CONFIG.RATE_LIMIT_MAX_REQUESTS) {
    throw httpError_("Too many requests", 429);
  }

  cache.put(cacheKey, String(current + 1), CONFIG.RATE_LIMIT_WINDOW_SECONDS);
}

function digest_(value) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value);
  return Utilities.base64EncodeWebSafe(bytes).slice(0, 32);
}

function parseBody_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw httpError_("Empty request body", 400);
  }

  try {
    return JSON.parse(e.postData.contents);
  } catch (error) {
    throw httpError_("Invalid JSON", 400);
  }
}

function assertSecret_(providedSecret) {
  var expectedSecret = PropertiesService.getScriptProperties().getProperty("API_SECRET");

  if (!expectedSecret) {
    throw httpError_("API_SECRET is not configured", 500);
  }

  if (!providedSecret || providedSecret !== expectedSecret) {
    throw httpError_("Unauthorized", 401);
  }
}

function handleJson_(callback) {
  try {
    return callback();
  } catch (error) {
    var statusCode = error && error.statusCode ? error.statusCode : 500;
    var message = getMessage_(error);
    return jsonResponse_(false, message, null, message, statusCode);
  }
}

function jsonResponse_(success, message, data, error, statusCode) {
  return ContentService.createTextOutput(
    JSON.stringify({
      success: success,
      message: message,
      data: data === undefined ? null : data,
      error: error || null,
      statusCode: statusCode,
    }),
  ).setMimeType(ContentService.MimeType.JSON);
}

function httpError_(message, statusCode) {
  return {
    message: message,
    statusCode: statusCode,
  };
}

function getMessage_(error) {
  return error && error.message ? error.message : String(error);
}

function toIsoString_(value) {
  if (Object.prototype.toString.call(value) === "[object Date]" && !isNaN(value.getTime())) {
    return value.toISOString();
  }

  return String(value || "");
}

function toBoolean_(value) {
  if (value === true) {
    return true;
  }

  return String(value).toLowerCase() === "true";
}
