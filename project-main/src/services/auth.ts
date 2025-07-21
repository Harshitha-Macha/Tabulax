interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

class AuthService {
  private baseUrl = 'http://localhost:5000/api/auth';

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      return {
        success: false,
        message: 'An error occurred during login. Please try again.',
      };
    }
  }

  async signUp(userData: {
    username: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      return {
        success: false,
        message: 'An error occurred during signup. Please try again.',
      };
    }
  }

  async googleSignIn(): Promise<AuthResponse> {
    try {
      // Initialize Google Sign-In
      const auth2 = await (window as any).gapi.auth2.getAuthInstance();
      const googleUser = await auth2.signIn();
      
      // Get the ID token
      const idToken = googleUser.getAuthResponse().id_token;
      
      // Send the token to your backend
      const response = await fetch(`${this.baseUrl}/google-signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: idToken }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        message: 'An error occurred during Google sign-in. Please try again.',
      };
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getToken() {
    return localStorage.getItem('token');
  }
}

export const authService = new AuthService(); 