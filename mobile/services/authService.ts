import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://htbo-production.up.railway.app/api/users';

type LoginCredentials = {
  username?: string;
  email?: string;
  password: string;
};

let currentToken: string | null = null;

export const authService = {
  async registerUser(username: string, email: string, password: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    const data = await response.json();
    return data.token;
  },

  async loginUser(credentials: LoginCredentials, remember: boolean): Promise<string> {
    const { username, email, password } = credentials;

    if ((!username && !email) || !password) {
      throw new Error('Username/Email and password are required');
    }

    const payload = username ? { username, password } : { email, password };

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    currentToken = data.token;
    await AsyncStorage.setItem('authData', JSON.stringify({
      token: data.token,
    }));

    if (remember) {
      await AsyncStorage.setItem('authData', JSON.stringify({
        token: data.token,
        remember: true
      }));
    } else {
      await AsyncStorage.removeItem('authData');
    }

    return data.token;
  },

  async logout(): Promise<void> {
    currentToken = null;
    await AsyncStorage.removeItem('authData');
  },

  async getToken(): Promise<string | null> {
    if (!currentToken) {
      const authData = await AsyncStorage.getItem('authData');
      console.log(authData);
      if (authData) {
        const parsedData = JSON.parse(authData);
        currentToken = parsedData.token;
      }
    }
    return currentToken;
  },

  async initializeAuth(): Promise<void> {
    const authData = await AsyncStorage.getItem('authData');
    if (authData) {
      const parsedData = JSON.parse(authData);
      if (parsedData.remember) {
        currentToken = parsedData.token;
      } else {
        await AsyncStorage.removeItem('authData');
      }
    }
  },

  async getUserData(): Promise<any> {
    const token = await this.getToken();
    
    if (!token) {
      throw new Error('Nincs bejelentkezve');
    }

    const response = await fetch(`${API_BASE_URL}/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Nem sikerült lekérni a felhasználói adatokat');
    }

    return await response.json();
  }
};