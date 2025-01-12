const jwt =require('jsonwebtoken');







function isAdmin(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }
    const token = authHeader.split(" ")[1]; // Extract token from Authorization header
 
    if (token) {
        jwt.verify(token, process.env.JWT_SEC, (err, user) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({ message: "Token expired. Please log in again." });
                }            
                return res.status(401).json({ message: "Invalid or expired token. Please log in again." });
            }
            req.user = user; // Attach user info to the request

            // Check if user has admin privileges
            if (user.role && user.role === "admin") {
                 next(); // Proceed if user is admin
            } else {
                return res.status(403).json({ message: "Access denied. Admins only." });
            }
        });
    }  
}



function isLoggedin(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }
    const token = authHeader.split(" ")[1]; // Extract token from Authorization header

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." }); // Missing token
    }

    jwt.verify(token, process.env.JWT_SEC, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token." }); // Invalid token
        }

        req.user = user; // Attach user info to the request
        next(); // Proceed if token is valid
    });
}

module.exports={isAdmin,isLoggedin}