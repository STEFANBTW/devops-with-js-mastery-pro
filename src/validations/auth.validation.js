import z from 'zod';

export const signUpSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters long').max(255).trim(),
    email: z.string().max(255).toLowerCase().trim(),
    password: z.string().min(6, 'Password must be at least 6 characters long').max(128).trim(),
    role: z.enum(['user', 'admin']).default('user')
});

export const signInSchema = z.object({
    email: z.string().max(255).toLowerCase().email('Invalid email address').trim(),
    password: z.string().min(1, 'Password must be at least 6 characters long').trim()
});