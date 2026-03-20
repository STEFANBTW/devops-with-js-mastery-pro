import { signUpSchema, signInSchema } from '#validations/auth.validation.js';
import { formatValidationError } from '#utils/format.js';
import logger from '#config/logger.js';
import { createUser, authenticateUser } from '#services/auth.service.js';
import { jwttoken } from '#utils/jwt.js';
import { cookies } from '#utils/cookies.js';

export const signUp = async (req, res, next) => {
    try {
        const validationResult = signUpSchema.safeParse(req.body);

        if (!validationResult.success) {
            return res.status(400).json({
                error: 'validation failed',
                details: formatValidationError(validationResult.error)
            });
        }

        const { name, email, password, role } = validationResult.data;

        const user = await createUser({ name, email, password, role })

        const token = jwttoken.sign({ id: user.id, email: user.email, role: user.role })

        cookies.set(res, 'token', token)

        logger.info(`User registered successfully: ${email}`)
        res.status(201).json({
            message: 'User Registered',
            user: {
                id: user.id, name: user.name, email: user.email, role: user.role
            }
        })
    } catch (e) {
        logger.error('Error signing up user', e);

        if (e.message === 'User with this email already exists') {
            return res.status(409).json({ error: 'User with this email already exists' });
        }

        next(e);
    }
}

export const signIn = async (req, res, next) => {
    try {
        const validationResult = signInSchema.safeParse(req.body);

        if (!validationResult.success) {
            return res.status(400).json({
                error: 'validation failed',
                details: formatValidationError(validationResult.error)
            });
        }

        const { email, password } = validationResult.data;

        const user = await authenticateUser({ email, password });

        const token = jwttoken.sign({ id: user.id, email: user.email, role: user.role });

        cookies.set(res, 'token', token);

        logger.info(`User logged in successfully: ${email}`);
        res.status(200).json({
            message: 'User Logged In',
            user: {
                id: user.id, name: user.name, email: user.email, role: user.role
            }
        });
    } catch (e) {
        logger.error('Error signing in user', e);

        if (e.message === 'User not found' || e.message === 'Invalid credentials') {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        next(e);
    }
}

export const signOut = async (req, res) => {
    try {
        cookies.clear(res, 'token');
        logger.info('User logged out successfully');
        res.status(200).json({ message: 'User Logged Out' });
    } catch (e) {
        logger.error('Error signing out user', e);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}