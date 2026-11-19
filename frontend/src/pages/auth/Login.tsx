import React, { useEffect, useState } from 'react';
import AuthLayout from '../../components/auth/AuthLayout';
import LoginForm from '../../components/auth/LoginForm';
import { takePasswordChangeNotice } from '../../lib/auth/auth';
export default function Login({ callbackNotice }: {
    callbackNotice?: string;
}) {
    const [passwordNotice, setPasswordNotice] = useState<string>();
    useEffect(() => {
        const notice = takePasswordChangeNotice();
        if (notice) setPasswordNotice(notice);
    }, []);
    return <AuthLayout><LoginForm callbackNotice={passwordNotice || callbackNotice}/></AuthLayout>;
}
