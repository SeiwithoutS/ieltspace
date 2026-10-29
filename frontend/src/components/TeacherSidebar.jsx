import React from 'react';
import AdminSidebar from './AdminSidebar';
export default function TeacherSidebar(){const page=location.hash.slice(1);const active=({TeacherHome:'home',TeacherQueue:'grading',TeacherGrade:'grading',TeacherHistory:'exams',StaffProfile:'profile'})[page] || '';return <AdminSidebar teacher active={active || 'none'} />;}
