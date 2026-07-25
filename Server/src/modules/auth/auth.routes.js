import { Router } from 'express';
import validate from '../../middlewares/validate.js';
import { changePasswordSchema, loginSchema, registerAdminSchema } from './auth.validation.js';
import { changePassword, getCurrentUser, login, logout, registerAdmin, getAllUsers, blockUser, deleteUser } from './auth.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.js';

const router = Router();

router.post('/register', authenticate, authorize(['Super Admin', 'Project Head']), validate(registerAdminSchema, 'body'), registerAdmin);
router.get('/allusers', authenticate, authorize(['Super Admin', 'Project Head']), getAllUsers);
router.post('/login', validate(loginSchema, 'body'), login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getCurrentUser);
router.patch('/change-password', authenticate, authorize(['Super Admin', 'Project Head']), validate(changePasswordSchema, 'body'), changePassword);
router.patch('/block-user/:id', authenticate, authorize(['Super Admin', 'Project Head']), blockUser);
router.delete("/delete/:id", authenticate, authorize(['Super Admin', 'Project Head']),deleteUser)
export default router;
