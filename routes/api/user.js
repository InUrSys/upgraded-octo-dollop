const express = require('express')
const router = express.Router();
const { check, validationResult } = require('express-validator')
const gravatar = require('gravatar')
const User = require('../../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
// @route   GET api/users
// @desc    Register user
// @access  Public
router.post('/', 
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email'),
        check('password', 'Please enter a password with 6 o more characters').isLength({min:6})
    ],
    async (req, res) => {
        
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }
    
        const { name, email, password } = req.body
        
        try {
            // See if user exists
            let user = await User.findOne({email}).exec()
            if (user) {
               return res.status(400).json({errors: [{msg: 'User already exists'}]}) 
            }
            // Get user gravatar
            const avatar = gravatar.profile_url(email, {s:'200', r: 'pg', d: 'mm'})
            
            user = new User({
                name,
                email,
                avatar,
                password
            });
            
            // Encrypt password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();
            
            // Return jsonwebtoken
            const payload = {
                user: {
                    id: user.id
                }
            }
            
            jwt.sign(payload, 
                config.get('jwtSecret'), 
                { expiresIn: 360000 }, 
                (err, token) => {
                if (err) throw err;
                res.json({token})
                })
            
        } catch (err) {
            console.error(err.message)
            res.status(500).send('Server Error')
        }
})

module.exports = router;