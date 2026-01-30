// server/routes/expenseRoutes.js
const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expenseController");

// GET: Ambil Semua Data
router.get("/", expenseController.getAllExpences);
// POST: Tambah Data
router.post("/", expenseController.createExpense);
// PUT: Update Data
router.put('/:id', expenseController.updateExpense);
// DELETE: Hapus Data
router.delete("/:id", expenseController.deleteExpense);

module.exports = router;
