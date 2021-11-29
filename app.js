
require("dotenv").config();
require("./config/database").connect();
const bcrypt = require('bcryptjs');
const express = require("express");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");
const cool = require('cool-ascii-faces');
const Joi = require('joi');
var cors = require('cors');

const app = express();

app.use(express.json());

app.use(cors({
    origin: '*'
}));

// importing model contexts
const User = require("./model/user");
const Post = require("./model/post");
const Comment = require("./model/comment");

    app.get("/", async (req, res, next) => 
    {
        res.json({ message: "Server working!" });
        next();
    });

    // Register User
    app.post("/register", async (req, res) => 
    {

        const schema = Joi.object({ 
            name: Joi.string().alphanum().min(3).max(30).required().error(() => 'name expecting a string'),
            email: Joi.string().min(3).required().email(),
            password: Joi.string().min(6).required(),
          }); 

        try 
        {

            const {error} = schema.validate(req.body);

             //Validate user input
             if (error) 
             {
                res.status(400).json(error);

                 //return errors;
             }

            // Get user input
            const { name, email, password } = req.body;

            //error.details[0].message

            console.log(error);

            // check if user already exist
            const oldUser = await User.findOne({ email });

            if (oldUser) 
            {
                return res.status(409).json("User Already Exist. Please Login");
            }

            //Encrypt password
            encryptedPassword = await bcrypt.hash(password, 10);

            // Create user in our database
            const user = await User.create({
                name,
                email: email.toLowerCase(), 
                password: encryptedPassword,
            
            });

            // Create token
            const token = jwt.sign(
            { user_id: user._id, email },
            process.env.TOKEN_KEY,
            {
                expiresIn: "1h",
            }
            );

            // return new user
            res.status(201).json({status: true, message: "User created successfully"});
        } 
        catch (err) 
        {
            console.log(err);
        }
        
    });

    // Login
    app.post("/login", async (req, res) => 
    {
        // our login logic goes here
        try 
        {
            // Get user input
            const { email, password } = req.body;
        
            // Validate user input
            if (!(email && password)) 
            {
                res.status(400).send("All input is required");
            }

            // Validate if user exist in our database
            const user = await User.findOne({ email });
        
            if (user && (await bcrypt.compare(password, user.password))) 
            {
                // Create token
                const token = jwt.sign(
                    { user_id: user._id, email },
                    process.env.TOKEN_KEY,
                    {
                    expiresIn: "2h",
                    }
                );
            
                // return token
                res.status(200).json({token: token});

            }
            else
            {
                res.status(400).json("Invalid Credentials");
            }

        } 
        catch (err) 
        {
            console.log(err);
        }
        
    });


    app.post("/create/post/", auth,  async (req, res) => 
    {
        try 
        {
            // Get post input
            const { title, body} = req.body;

            // Validate user input
            if (!(title && body)) 
            {
                res.status(400).json("All input are required");
            }

            // Create user in our database
            const post = await Post.create({

                title,
                body,
                user_id: "hjvhvyu"

            });

            // return new user
            res.status(201).json({status: 201, message: "Post created successfully"});

        } 
        catch (err) 
        {
            console.log(err);
        }
        
    });



    app.post("/create/post/comment", auth,  async (req, res) => 
    {
        try 
        {
            // Get user input
            const { message, post_id} = req.body;

            // Validate user input
            if (!(message && post_id)) 
            {
                res.status(400).json("All input are required");
            }

            // Create user in our database
            const comment = await Comment.create({

            message,
            user_id: "hjvhvyu"

            });
            
            Post.updateOne({_id: post_id}, {$push: {comments: 3}});

            res.status(201).json({status: 201, message: "Comment created successfully"});

        } 
        catch (err) 
        {
            console.log(err);
        }
        
    });


    app.post("/create/post/like", auth,  async (req, res) => 
    {
        try 
        {
            // Get user input
            const { post_id} = req.body;

            // Validate user input
            if (!(post_id)) 
            {
                res.status(400).json("All input are required");
            }

            // Update lik in our database
            Post.updateOne({_id: post_id}, {$push: {likes: 3}});

            // return new user
            res.status(201).json({status: 201, message: "Post liked successfully"});

        } 
        catch (err) 
        {
            console.log(err);
        }
        
    });


    app.get("/posts", auth, async (req, res) => 
    {
        try 
        {
    
            Post.find().sort([['createdAt', -1]])
               .then((posts) => {
                return res.status(200).json({
                    success: true,
                    message: 'A list of all posts',
                    data: posts,
                    });
                })
                .catch((err) => {
                  return res.status(500).json({
                    success: false,
                    message: 'Server error. Please try again.',
                    error: err.message,
                });
                });

        } 
        catch (err) 
        {
            console.log(err);
        }
        
    });


    app.get("/post",  auth, async (req, res) => 
    {
        try 
        {
            const { id} = req.body;

            Post.findOne({ "_id" : id })
                .then((post) => {
                return res.status(200).json({
                    status: true,
                    message: 'Get post details',
                    data: post,
                });
                })
                .catch((err) => {
                return res.status(500).json({
                    status: false,
                    message: 'Server error. Please try again.',
                    error: err.message,
                });
                });

        } 
        catch (err) 
        {
            console.log(err);
        }
        
    });

    app.post("/delete/post",  auth, async (req, res) => 
    {
        try 
        {

            Post.findOneAndDelete({id: req.params.id}, req.body ).then(function(card){
                res.status(200).json({status: true, message: "Post deleted successfully"});
            }); 

        } 
        catch (err) 
        {
            console.log(err);
        }
        
    });

    module.exports = app;
