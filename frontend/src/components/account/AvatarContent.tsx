import { useEffect, useState } from 'react';
import { getAvatarUrl } from '../../lib/auth/profile-api';

export default function AvatarContent({ avatar, initials }: { avatar?: string | null; initials: string }) {
  const [image, setImage] = useState<{ path: string; url: string } | null>(null);
  useEffect(() => {
    if (!avatar || /^https:\/\//i.test(avatar)) return;
    let active = true;
    void getAvatarUrl(avatar).then(url => {
      if (active && url) setImage({ path: avatar, url });
    }).catch(() => {});
    return () => { active = false; };
  }, [avatar]);

  const url = avatar && /^https:\/\//i.test(avatar) ? avatar : image?.path === avatar ? image?.url : undefined;
  const [failedUrl, setFailedUrl] = useState<string>();
  return url && url !== failedUrl
    ? <img src={url} alt="" referrerPolicy="no-referrer" onError={() => setFailedUrl(url)} className="block h-full w-full rounded-full object-cover" />
    : <>{initials}</>;
}
