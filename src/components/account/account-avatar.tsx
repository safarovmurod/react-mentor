'use client';
import { useState } from 'react';
import { useAccount } from './account-provider';
export function AccountAvatar() {
  const {profile}=useAccount();const [failed,setFailed]=useState<string|null>(null);
  const name=profile?.displayName || 'Гость';const url=profile?.avatarUrl;
  return <span className="avatar" aria-label={name}>{url && failed!==url ? /* User uploads, private signed URL. */
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" onError={()=>setFailed(url)}/>:name.slice(0,1).toUpperCase()}</span>;
}
