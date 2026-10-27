import { useState } from 'react';
import { setOwnerKey } from '../lib/api.js';

// Shown only to the site owner's browser when the API is locked: the key is checked by the server, not here.
export default function OwnerKeyForm({ onSaved }) {
  const [value, setValue] = useState('');
  return <form className="owner-key" onSubmit={(event) => { event.preventDefault(); setOwnerKey(value.trim()); setValue(''); onSaved(); }}>
    <input type="password" aria-label="Owner key" placeholder="Owner key" autoComplete="off" value={value} onChange={(event) => setValue(event.target.value)} />
    <button type="submit" disabled={!value.trim()}>Unlock</button>
  </form>;
}
