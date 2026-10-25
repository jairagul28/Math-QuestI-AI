const { randomInt } = require('crypto');

const NICKNAME_ADJECTIVES = ['Pixel', 'Cosmic', 'Clever', 'Bright', 'Nimble', 'Sunny', 'Brave', 'Curious'];
const NICKNAME_ANIMALS = ['Panda', 'Otter', 'Falcon', 'Koala', 'Tiger', 'Dolphin', 'Fox', 'Turtle'];

function generateLeaderboardNickname() {
  return `${NICKNAME_ADJECTIVES[randomInt(NICKNAME_ADJECTIVES.length)]}`
    + `${NICKNAME_ANIMALS[randomInt(NICKNAME_ANIMALS.length)]}${randomInt(100, 1000)}`;
}

function createLeaderboard(students, period, weekKey, currentUserId) {
  const ranked = students
    .map((student) => ({
      id: String(student._id),
      displayName: student.leaderboardNickname,
      avatar: student.equippedAvatar || 'fox',
      accessory: student.equippedAccessory || 'none',
      level: student.level || 1,
      xp: period === 'weekly'
        ? (student.weeklyXPWeek === weekKey ? student.weeklyXP || 0 : 0)
        : student.totalXP || 0,
    }))
    .sort((left, right) =>
      right.xp - left.xp
      || right.level - left.level
      || left.displayName.localeCompare(right.displayName)
    )
    .map((student, index) => ({ ...student, rank: index + 1 }));

  const currentUser = ranked.find((student) => student.id === String(currentUserId)) || null;
  const entries = ranked.slice(0, 10).map(({ id, ...entry }) => ({
    ...entry,
    isCurrentUser: id === String(currentUserId),
  }));
  const currentUserEntry = currentUser
    ? (({ id, ...entry }) => ({ ...entry, isCurrentUser: true }))(currentUser)
    : null;

  return { entries, currentUser: currentUserEntry };
}

module.exports = { createLeaderboard, generateLeaderboardNickname };
