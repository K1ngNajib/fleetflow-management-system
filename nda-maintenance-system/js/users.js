/* =====================================================
   USER MANAGEMENT MODULE
   Provides local login, logout, user creation/editing,
   role permissions, and browser Web Crypto password hashing.
===================================================== */
const Roles=['Administrator','Fleet Commander','Maintenance Officer','Logistics Officer','Read Only'];
const Users={
/** Hash a password with SHA-256 for offline credential storage. */
async hash(password){const data=new TextEncoder().encode(password);const hash=await crypto.subtle.digest('SHA-256',data);return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('');},
/** Create or update a user record. */
async create(data){const user={id:data.id||crypto.randomUUID(),username:data.username,name:data.name,role:data.role,passwordHash:data.passwordHash||await this.hash(data.password||'changeme')};await Storage.put('users',user);return user;},
/** Validate login credentials. */
async login(username,password){const users=await Storage.all('users');const h=await this.hash(password);return users.find(u=>u.username===username&&u.passwordHash===h);},
/** Render local user administration. */
async render(){const rows=await Storage.all('users');document.getElementById('content').innerHTML=`<form class="card inline-form" id="user-form"><h3>Create User</h3><div class="form-grid"><label>Name<input name="name" required></label><label>Username<input name="username" required></label><label>Password<input name="password" type="password" required></label><label>Role<select name="role">${Roles.map(r=>`<option>${r}</option>`).join('')}</select></label></div><div class="form-actions"><button class="btn btn-primary">Save User</button></div></form>`;App.renderTable('Users',rows,['name','username','role'],async(id)=>{await Storage.remove('users',id);await Audit.log('Delete','Users',id);Users.render();},'users',true);document.getElementById('user-form').onsubmit=async e=>{e.preventDefault();await Users.create(formData(e.target));await Audit.log('Create','Users',e.target.username.value);Users.render();};}
};
