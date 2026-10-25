import React from 'react';
import { Sparkles } from 'lucide-react';
import Badge from '../ui/Badge';
import { getXPProgress } from '../../utils/gamification';
import { AVATAR_EMOJI, ACCESSORY_EMOJI } from '../../utils/rewardCatalog';

const XPProgressChip = ({ totalXP = 0, compact = false, avatarId = 'fox', accessoryId = 'none' }) => {
  const { currentLevel, percentage, xpNeeded } = getXPProgress(totalXP);

  return (
    <Badge
      variant="yellow"
      className={`flex items-center gap-2 ${compact ? 'py-1 px-2 text-xs' : 'py-1.5 px-3'}`}
      title={`Level ${currentLevel}; ${xpNeeded} XP to the next level`}
      aria-label={`${totalXP} XP, level ${currentLevel}, ${xpNeeded} XP to next level`}
    >
      <span className="relative grid h-5 w-5 place-items-center rounded-full bg-white/70 text-sm" aria-hidden="true">
        {AVATAR_EMOJI[avatarId] || AVATAR_EMOJI.fox}
        {ACCESSORY_EMOJI[accessoryId] && (
          <span className="absolute -right-2 -top-2 text-[9px]">{ACCESSORY_EMOJI[accessoryId]}</span>
        )}
      </span>
      <Sparkles className="h-3.5 w-3.5 shrink-0 fill-amber-500 text-amber-500" aria-hidden="true" />
      <span className="font-bold">Lv {currentLevel}</span>
      <span>{totalXP} XP</span>
      <span className="h-1.5 w-10 overflow-hidden rounded-full bg-amber-200" aria-hidden="true">
        <span
          className="block h-full rounded-full bg-amber-600 transition-[width] duration-500"
          style={{ width: `${percentage}%` }}
        />
      </span>
    </Badge>
  );
};

export default XPProgressChip;
