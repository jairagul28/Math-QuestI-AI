const User = require('../models/User');
const Achievement = require('../models/Achievement');

const AVATARS = [
  { id: 'fox', name: 'Swift Fox', emoji: '🦊', rule: 'Start your adventure' },
  { id: 'robot', name: 'Math Bot', emoji: '🤖', rule: 'Reach Level 2' },
  { id: 'wizard', name: 'Number Wizard', emoji: '🧙', rule: 'Reach Level 3' },
  { id: 'astronaut', name: 'Space Explorer', emoji: '🧑‍🚀', rule: 'Reach Level 4' },
  { id: 'dragon', name: 'Puzzle Dragon', emoji: '🐉', rule: 'Reach Level 5 or a 14-day streak' },
];

const ACCESSORIES = [
  { id: 'none', name: 'No accessory', emoji: '', rule: 'Available from the start' },
  { id: 'star-glasses', name: 'Star Glasses', emoji: '🤓', rule: 'Earn the First Steps badge' },
  { id: 'explorer-cape', name: 'Explorer Cape', emoji: '🦸', rule: 'Reach a 7-day streak' },
  { id: 'galaxy-background', name: 'Galaxy Background', emoji: '🌌', rule: 'Reach Level 3' },
];

function meetsAvatarRule(avatarId, user) {
  switch (avatarId) {
    case 'fox': return true;
    case 'robot': return (user.level || 1) >= 2;
    case 'wizard': return (user.level || 1) >= 3;
    case 'astronaut': return (user.level || 1) >= 4;
    case 'dragon': return (user.level || 1) >= 5 || (user.currentStreak || 0) >= 14;
    default: return false;
  }
}

function meetsAccessoryRule(accessoryId, user, badgeCodes) {
  switch (accessoryId) {
    case 'none': return true;
    case 'star-glasses': return badgeCodes.has('FIRST_STEPS');
    case 'explorer-cape': return (user.longestStreak || 0) >= 7;
    case 'galaxy-background': return (user.level || 1) >= 3;
    default: return false;
  }
}

async function getAvatarCatalog(userId) {
  const user = await User.findById(userId);
  const earnedBadges = await Achievement.find({ userId }).select('badgeCode');
  const badgeCodes = new Set(earnedBadges.map((badge) => badge.badgeCode));
  const unlockedAvatarIds = AVATARS.filter((avatar) => meetsAvatarRule(avatar.id, user))
    .map((avatar) => avatar.id);
  const unlockedAccessoryIds = ACCESSORIES.filter((accessory) =>
    meetsAccessoryRule(accessory.id, user, badgeCodes)
  ).map((accessory) => accessory.id);

  await User.findByIdAndUpdate(userId, {
    $addToSet: {
      unlockedAvatarIds: { $each: unlockedAvatarIds },
      unlockedAccessoryIds: { $each: unlockedAccessoryIds },
    },
  });

  return {
    equippedAvatar: user.equippedAvatar || 'fox',
    equippedAccessory: user.equippedAccessory || 'none',
    avatars: AVATARS.map((avatar) => ({
      ...avatar,
      unlocked: unlockedAvatarIds.includes(avatar.id),
    })),
    accessories: ACCESSORIES.map((accessory) => ({
      ...accessory,
      unlocked: unlockedAccessoryIds.includes(accessory.id),
    })),
  };
}

async function equipAvatarRewards(userId, avatarId, accessoryId) {
  const catalog = await getAvatarCatalog(userId);
  const avatar = catalog.avatars.find((item) => item.id === avatarId);
  const accessory = catalog.accessories.find((item) => item.id === accessoryId);
  if (!avatar || !avatar.unlocked || !accessory || !accessory.unlocked) {
    const error = new Error('Choose an unlocked avatar and accessory.');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { equippedAvatar: avatarId, equippedAccessory: accessoryId } },
    { new: true }
  );
  return {
    ...catalog,
    equippedAvatar: user.equippedAvatar,
    equippedAccessory: user.equippedAccessory,
  };
}

module.exports = { AVATARS, ACCESSORIES, getAvatarCatalog, equipAvatarRewards };
