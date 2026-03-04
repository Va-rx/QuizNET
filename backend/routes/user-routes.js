const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { saveUser, findUserByEmail } = require("../database/database-queries/user-queries");

router.post("/register", (req, res) => {
    const user = req.body;
    saveUser(user)
        .then(user => {
            res.send(user);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the user."
            });
        });
 }
);

router.post("/login", (req, res) => {
    const {email, password} = req.body;
    findUserByEmail(email)
        .then(user => {
            if (!user) {
                return res.status(404).send({message: "User not found"});
            }
            bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
                let token = jwt.sign({ id: user.id },process.env.JWT_SECRET_KEY, {
                    expiresIn: 1 * 24 * 60 * 60 * 1000,
                });

                user.accessToken = token;
                res.cookie("jwt", token, { maxAge: 1 * 24 * 60 * 60, httpOnly: true });
                return res.status(201).send(user);
            } else {
                return res.status(401).send({message: "Invalid credentials"});
            }
        });
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while finding the user."
            });
        });

});

module.exports = router;