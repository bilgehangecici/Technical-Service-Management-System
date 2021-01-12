var express = require("express");
var router = express.Router();
var sql = require("mssql");
const sqlConfig = require("../config");

// Get all information from storage.
router.get("/", (req, res) => {
  sql.connect(sqlConfig, () => {
    var request = new sql.Request();
    request.query("SELECT * FROM STORAGE", (err, recordsets) => {
      if (err) {
        console.log(err);
        if (err.code === "ENOCONN")
          return res.status(503).send({ error: { err } });
        return res.status(400).send({ error: { err } });
      }

      res.setHeader("Content-Type", "application/json");
      sql.close();
      return res.status(200).send({ storage: recordsets.recordset }); // Result in JSON format
    });
  });
});

router.post("/insertNewPart", (req, res) => {
  var partID = req.body.partID;
  var partName = req.body.partName;
  var partModel = req.body.partModel;
  var partColor = req.body.partColor;
  var partPrice = req.body.partPrice;
  var quantity = req.body.partColor;
  var boxNumber = req.body.boxNumber;

  sql.connect(sqlConfig, () => {
    var request = new sql.Request();
    request.input("partID", sql.BigInt, partID || null);
    request.input("partName", sql.NVarChar(50), partName || "NULL");
    request.input("partModel", sql.NVarChar(50), partModel || "NULL");
    request.input("partColor", sql.NVarChar(100), partColor || "NULL");
    request.input("partPrice", sql.SmallMoney, partPrice || null);
    request.input("quantity", sql.SmallInt, quantity || null);
    request.input("boxNumber", sql.SmallInt, boxNumber || null);
    request.execute("sp_insertNewPartIntoStorage", (err, result) => {
      if (err) {
        console.log(err);
        if (err.code === "ENOCONN")
          return res.status(503).send({ error: { err } });
        return res.status(400).send({ error: { err } });
      }

      res.setHeader("Content-Type", "application/json");
      sql.close();

      return res.status(200).send({ newPart: { ...req.body } });
    });
  });
});

// Get part's quantity info with given quantity parameter.
router.get("/parts/:lessThan", (req, res) => {
  sql.connect(sqlConfig, () => {
    var request = new sql.Request();
    request.input("lessThan", sql.Int, req.params.lessThan);
    request.execute("sp_getPartsLessThanInStorage", (err, result) => {
      if (err) {
        console.log(err);
        if (err.code === "ENOCONN")
          return res.status(503).send({ error: { err } });
        return res.status(400).send({ error: { err } });
      }
      res.setHeader("Content-Type", "application/json");
      sql.close();
      return res.status(200).send({ parts: result.recordsets });
    });
  });
});

module.exports = router;
