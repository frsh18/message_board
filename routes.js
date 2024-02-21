// routes.js
const express = require("express");
const router = express.Router();
const mongoConfig = require("./mongoConfig");


router.get("/", async function (req, res) {
    try {
        const page = parseInt(req.query.page) || 1; // 頁數定義
        const pageSize =4; // 每頁顯示的數量

        const db = mongoConfig.getDb();
        const collection = db.collection("message");
        // 獲取總留言
        const totalMessages = await collection.countDocuments({});
        const totalPages = Math.ceil(totalMessages / pageSize);
        // 獲取數據庫的數據
        const result = await collection
            .find({})
            .sort({ timestamp: -1 })
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .toArray();
        let data = result || [];
        if (req.query.messageAdded) {
            const newMessage = {
                name: req.query.name,
                message: req.query.message
            };
            data.unshift(newMessage);
        }

        res.render("index.ejs", { data: data, totalPages: totalPages, currentPage: page });
    } catch (error) {
        console.error("Error in GET route:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.post("/", async function (req, res) {
    try {
        const name = req.body.name;
        const message = req.body.message;
        const currentTime = new Date();

        const db = mongoConfig.getDb();
        const collection = db.collection("message");

        await collection.insertOne({
            name: name, 
            message: message,
            timestamp: currentTime
        });

        res.redirect("/");
    } catch (error) {
        console.error("Error in post route:", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;