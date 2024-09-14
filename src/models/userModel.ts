import pool from '../db/db';


//createUser
export const createUser = async (name: string,email:string,type:string, password: string) => {
  const result = await pool.query(
    'INSERT INTO users (name,email,type,password) VALUES ($1,$2,$3,$4) RETURNING *',
    [name,email,type, password]
  );
  return result.rows[0];
};

//getUser by email
export const getUserByEmail = async (email: string) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null; 
  };
  
///get user by username
export const getUserByUsername = async (username: string) => {
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  return result.rows[0];
};
