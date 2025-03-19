// Middleware for Role-Based Access Control
const roleAuthorization = (allowedRoles) => {
  return (req, res, next) => {
    // Check if the user is authenticated
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: No valid user role found.",
      });
    }

    // Check if the user's role is in the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message:
          "Forbidden: You do not have permission to access this resource.",
      });
    }

    // If the user has the correct role, proceed to the next middleware or route handler
    next();
  };
};

module.exports = roleAuthorization;
