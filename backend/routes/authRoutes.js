const {
  register,
  login,
  getAllUsers,
  getSingleUser,
  deleteUser,
  updateUser,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const roleAuthorization = require("../middleware/roleAuthorization"); // Importing role-based authorization middleware

const router = require("express").Router();

// Registering the User (Anyone can register, no role check needed)
router.route("/register").post(register);

// Login User (Anyone can login, no role check needed)
router.route("/login").post(login);

// Get All Users (Only accessible by Admin)
router
  .route("/users")
  .get(authMiddleware, roleAuthorization(["admin"]), getAllUsers); // Only Admin can access this route

// Get Single User, Update User, and Delete User (Authorization based on User's role)
// - Admin can access all users, Doctor can access their own data, and Patient can access their own data
router
  .route("/user/:id")
  .get(
    authMiddleware,
    roleAuthorization(["admin", "doctor", "patient"]),
    getSingleUser
  ) // Admin, Doctor, and Patient can view their own profile
  .delete(authMiddleware, roleAuthorization(["admin", "doctor"]), deleteUser) // Only Admin can delete users
  .put(
    authMiddleware,
    roleAuthorization(["admin", "doctor", "patient"]),
    updateUser
  ); // Admin, Doctor, and Patient can update their own profile

module.exports = router;
