import React from 'react';
import { RegisterForm } from '../components/auth/RegisterForm';

export const RegisterPage: React.FC = () => {
    return (
        <div className="auth-page">
            <RegisterForm />
        </div>
    );
};