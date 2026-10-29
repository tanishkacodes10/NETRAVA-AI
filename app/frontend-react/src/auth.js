
const USERS = 'es_users';
const CUR = 'es_current';

export function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS)) || [];
  } catch {
    return [];
  }
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(CUR)) || null;
  } catch {
    return null;
  }
}

export function signup({ name, email, password }) {
  name = name.trim();
  email = email.trim().toLowerCase();

  if (!name || !email || !password) {
    return { error: 'Please fill in all fields.' };
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters.' };
  }

  const users = getUsers();

  if (users.some((u) => u.email === email)) {
    return { error: 'This email is already registered. Please log in.' };
  }

  const user = {
    name,
    email,
    password,
    role: 'student'
  };

  try {
    localStorage.setItem(USERS, JSON.stringify([...users, user]));

    const currentUser = {
      name,
      email,
      role: 'student'
    };

    localStorage.setItem(CUR, JSON.stringify(currentUser));

    return { user: currentUser };
  } catch {
    return { error: 'Unable to save account. Please check browser storage.' };
  }
}

export function login({ email, password }) {
  email = email.trim().toLowerCase();

  if (!email || !password) {
    return { error: 'Please enter email and password.' };
  }

  const user = getUsers().find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    return { error: 'Invalid email or password.' };
  }

  const currentUser = {
    name: user.name,
    email: user.email,
    role: user.role || 'student'
  };

  try {
    localStorage.setItem(CUR, JSON.stringify(currentUser));
    return { user: currentUser };
  } catch {
    return { error: 'Unable to log in. Please check browser storage.' };
  }
}

export function logout() {
  localStorage.removeItem(CUR);
}

export function go(route) {
  window.location.hash = route;
}
