import React, { useEffect, useState } from 'react';
import { Check, Lock, Save, Sparkles } from 'lucide-react';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { usersAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { AVATAR_EMOJI, ACCESSORY_EMOJI } from '../utils/rewardCatalog';

const AvatarPickerPage = () => {
  const { refreshUser } = useAuth();
  const [catalog, setCatalog] = useState(null);
  const [avatarId, setAvatarId] = useState('fox');
  const [accessoryId, setAccessoryId] = useState('none');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    usersAPI.getAvatarRewards()
      .then((response) => {
        const rewards = response.data.data;
        setCatalog(rewards);
        setAvatarId(rewards.equippedAvatar);
        setAccessoryId(rewards.equippedAccessory);
      })
      .catch((requestError) => {
        console.error('[AvatarPickerPage] Could not load avatar catalog:', requestError);
        setError(requestError.response?.data?.message || 'Could not load your avatar collection.');
      })
      .finally(() => setLoading(false));
  }, []);

  const saveAvatar = async () => {
    try {
      setSaving(true);
      setError('');
      const response = await usersAPI.equipAvatar({ avatarId, accessoryId });
      setCatalog(response.data.data);
      setMessage('Your avatar is ready for the next quest!');
      window.dispatchEvent(new CustomEvent('mq:avatar-equipped', { detail: response.data.data }));
      if (refreshUser) await refreshUser();
    } catch (requestError) {
      console.error('[AvatarPickerPage] Could not equip avatar:', requestError);
      setError(requestError.response?.data?.message || 'Could not save your avatar.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-72 animate-pulse rounded-3xl bg-slate-200" aria-label="Loading avatars" />;

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-purple-600">Customize your character</p>
        <h1 className="mt-1 text-3xl font-black text-slate-900">Avatar Workshop</h1>
        <p className="mt-2 text-sm text-slate-600">Unlock characters and accessories by learning—no purchases required.</p>
      </div>
      {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</p>}
      {message && <p role="status" className="rounded-xl bg-teal-50 p-3 text-sm font-bold text-teal-800">{message}</p>}

      <Card className="bg-gradient-to-r from-purple-700 via-indigo-600 to-teal-500 text-white">
        <CardContent className="flex items-center gap-5 p-7">
          <span className="grid h-24 w-24 place-items-center rounded-3xl bg-white/20 text-6xl" aria-label="Selected avatar">
            {AVATAR_EMOJI[avatarId] || '🦊'}
          </span>
          <div>
            <Badge variant="yellow">Your equipped avatar</Badge>
            <h2 className="mt-2 text-2xl font-black">
              {catalog?.avatars.find((avatar) => avatar.id === avatarId)?.name || 'Swift Fox'}
            </h2>
            <p className="mt-1 text-purple-100">
              {ACCESSORY_EMOJI[accessoryId]} {catalog?.accessories.find((item) => item.id === accessoryId)?.name}
            </p>
          </div>
        </CardContent>
      </Card>

      <section aria-labelledby="characters-title" className="space-y-3">
        <h2 id="characters-title" className="text-xl font-black text-slate-900">Characters</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(catalog?.avatars || []).map((avatar) => (
            <button
              key={avatar.id}
              type="button"
              disabled={!avatar.unlocked}
              aria-pressed={avatarId === avatar.id}
              onClick={() => { setAvatarId(avatar.id); setMessage(''); }}
              className={`rounded-3xl border p-5 text-left transition-colors ${
                !avatar.unlocked
                  ? 'cursor-not-allowed border-slate-200 bg-slate-100 opacity-70'
                  : avatarId === avatar.id
                    ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                    : 'border-slate-200 bg-white hover:border-purple-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-4xl" aria-hidden="true">{avatar.emoji}</span>
                {avatar.unlocked
                  ? <Check className="h-5 w-5 text-teal-600" aria-hidden="true" />
                  : <Lock className="h-5 w-5 text-slate-400" aria-hidden="true" />}
              </div>
              <h3 className="mt-3 font-black text-slate-900">{avatar.name}</h3>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                {avatar.unlocked ? 'Unlocked!' : `Unlock hint: ${avatar.rule}`}
              </p>
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="accessories-title" className="space-y-3">
        <h2 id="accessories-title" className="text-xl font-black text-slate-900">Accessories</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {(catalog?.accessories || []).map((accessory) => (
            <button
              key={accessory.id}
              type="button"
              disabled={!accessory.unlocked}
              aria-pressed={accessoryId === accessory.id}
              onClick={() => { setAccessoryId(accessory.id); setMessage(''); }}
              className={`flex items-center gap-3 rounded-2xl border p-4 text-left ${
                !accessory.unlocked
                  ? 'cursor-not-allowed border-slate-200 bg-slate-100 opacity-70'
                  : accessoryId === accessory.id
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-slate-200 bg-white hover:border-teal-300'
              }`}
            >
              <span className="text-2xl" aria-hidden="true">{accessory.emoji || '✨'}</span>
              <span className="flex-1">
                <span className="block font-bold text-slate-800">{accessory.name}</span>
                <span className="block text-xs text-slate-500">
                  {accessory.unlocked ? 'Unlocked!' : `Unlock hint: ${accessory.rule}`}
                </span>
              </span>
              {!accessory.unlocked && <Lock className="h-4 w-4 text-slate-400" aria-hidden="true" />}
            </button>
          ))}
        </div>
      </section>

      <Button variant="playful" size="md" onClick={saveAvatar} disabled={saving} className="gap-2">
        <Save className="h-4 w-4" aria-hidden="true" />
        {saving ? 'Saving…' : <><Sparkles className="h-4 w-4" /> Equip this look</>}
      </Button>
    </div>
  );
};

export default AvatarPickerPage;
