import Register from '../components/Register';

/**
 * RegisterPage - Connects to the auth API and Briefing schema
 * 
 * This page handles user registration which:
 * 1. Connects to the auth API (/api/auth/register) via the Register component
 * 2. Saves user preferences matching the User model schema (backend/src/models/User.model.ts)
 *    - topics: string[] (array)
 *    - interests: string[] (array)
 *    - jobIndustry: string
 *    - demographic: string
 * 3. These preferences are used when generating briefings, matching the Briefing model schema
 *    (backend/src/models/Briefing.model.ts) request structure
 */
interface Props {
  onNavigateToLogin?: () => void;
  onRegister?: (email: string, token: string) => void;
}

const RegisterPage = ({ onNavigateToLogin, onRegister }: Props) => {
  return <Register onNavigateToLogin={onNavigateToLogin} onRegister={onRegister} />;
};

export default RegisterPage;
