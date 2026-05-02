import { Router } from "express";
import { login_user, register_user, logout_user, get_user, google_auth, refresh_token } from "../controller/auth.controller";
import { isAuthenticated } from "../middleware/auth.Middleware";
import { validate } from "../middleware/validate.Middleware";
import { loginSchema, registerSchema, googleAuthSchema } from "../schemas/auth.schema";

const router = Router();

router.post("/login", validate(loginSchema), login_user);
router.post("/register", validate(registerSchema), register_user);
router.post("/google", validate(googleAuthSchema), google_auth);
router.post("/refresh", refresh_token);
router.post("/logout", isAuthenticated, logout_user);
router.get("/user", isAuthenticated, get_user);

export default router;
