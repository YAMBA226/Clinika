import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

// Simulation d'un système de hashage simple pour la démo
const hashPassword = (password: string): string => {
  // En production, utiliser bcrypt ou équivalent
  return btoa(password + 'clinika_salt');
};

const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};

// Données de test pour la démo avec mots de passe hashés
const testUsers: (User & { passwordHash: string })[] = [
  {
    id: '1',
    email: 'dr.kamara@clinika.com',
    nom: 'Kamara',
    prenom: 'Amadou',
    role: 'medecin',
    telephone: '+225 01 23 45 67',
    specialite: 'Médecine Générale',
    passwordHash: hashPassword('medecin123'),
    isFirstLogin: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    email: 'inf.diallo@clinika.com',
    nom: 'Diallo',
    prenom: 'Fatima',
    role: 'infirmier',
    telephone: '+225 07 89 01 23',
    passwordHash: hashPassword('infirmier123'),
    isFirstLogin: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    email: 'ass.kone@clinika.com',
    nom: 'Koné',
    prenom: 'Mariam',
    role: 'assistant',
    telephone: '+225 05 67 89 01',
    passwordHash: hashPassword('assistant123'),
    isFirstLogin: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    email: 'admin@clinika.com',
    nom: 'Traoré',
    prenom: 'Ibrahim',
    role: 'admin',
    telephone: '+225 02 34 56 78',
    passwordHash: hashPassword('admin123'),
    isFirstLogin: false,
    createdAt: new Date().toISOString()
  }
];

// Stockage des utilisateurs avec mots de passe hashés
let usersDatabase = [...testUsers];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        // Simulation d'authentification avec vérification du hash
        const user = usersDatabase.find(u => u.email === email);
        
        if (user && verifyPassword(password, user.passwordHash)) {
          const token = `jwt_token_${user.id}_${Date.now()}`;
          
          // Retourner l'utilisateur sans le hash du mot de passe
          const { passwordHash, ...userWithoutPassword } = user;
          
          set({
            user: userWithoutPassword,
            token,
            isAuthenticated: true
          });
          
          return true;
        }
        
        return false;
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData };
          
          // Mettre à jour dans la base de données simulée
          const userIndex = usersDatabase.findIndex(u => u.id === currentUser.id);
          if (userIndex !== -1) {
            usersDatabase[userIndex] = { ...usersDatabase[userIndex], ...userData };
          }
          
          set({
            user: updatedUser
          });
        }
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        const currentUser = get().user;
        if (!currentUser) return false;
        
        const user = usersDatabase.find(u => u.id === currentUser.id);
        if (!user || !verifyPassword(currentPassword, user.passwordHash)) {
          return false;
        }
        
        // Mettre à jour le mot de passe
        user.passwordHash = hashPassword(newPassword);
        user.isFirstLogin = false;
        
        return true;
      }
    }),
    {
      name: 'clinika-auth'
    }
  )
);

// Fonction pour ajouter un utilisateur (utilisée par l'admin)
export const addUser = (userData: Omit<User, 'id' | 'createdAt'> & { password: string }): boolean => {
  try {
    const newUser = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
      passwordHash: hashPassword(userData.password),
      isFirstLogin: true,
      createdAt: new Date().toISOString()
    };
    
    // Vérifier si l'email existe déjà
    if (usersDatabase.find(u => u.email === userData.email)) {
      return false;
    }
    
    usersDatabase.push(newUser);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'utilisateur:', error);
    return false;
  }
};

// Fonction pour obtenir tous les utilisateurs (pour l'admin)
export const getAllUsers = (): User[] => {
  return usersDatabase.map(({ passwordHash, ...user }) => user);
};