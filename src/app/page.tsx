import { redirect } from 'next/navigation';

export default function Home() {
    // Automatically forwards anyone who visits the root URL to the dashboard
    redirect('/superadmin');
}