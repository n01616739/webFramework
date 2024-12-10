const jwt = require('jsonwebtoken');

const authenticateAdmin = (req, res, next) => {
    const token = req.cookies.authToken; // Ensure this matches how you're storing the token
    if (!token) {
        return res.status(403).render('error', {
            message: 'Access denied',
            error: 'No token provided'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultSecretKey');
        console.log('Decoded Token:', decoded); // Debug log
        if (decoded.role !== 'admin') {
            return res.status(403).render('error', {
                message: 'Access restricted to admin users only',
                error: 'You do not have the required permissions'
            });
        }
        next();
    } catch (err) {
        console.error('Token verification error:', err);
        res.status(403).render('error', {
            message: 'Invalid token',
            error: err.message
        });
    }
};

module.exports = authenticateAdmin;
