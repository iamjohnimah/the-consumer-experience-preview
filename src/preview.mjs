export const HOSTED_APP = 'https://spreeai-consumer-experience.iamjohnimah.chatgpt.site/';
export const PREVIEW_KEY = 'spreeai-consumer-public-v1';
export const asset = path => import.meta.env.BASE_URL + path.replace(/^\//, '');

export function persistPreview(storage, value) {
  storage.setItem(PREVIEW_KEY, JSON.stringify(value));
}

export function previewSocial(state) {
  return {
    people: [], posts: state.posts || [], rooms: state.communityRooms || [],
    memberships: state.roomMemberships || [], following: state.following || [],
    votes: state.postVotes || [], followers: 0,
  };
}

export function previewAction(state, path, body) {
  if (path === 'rooms') {
    const room = { ...body, id: crypto.randomUUID() };
    return { ...state, communityRooms: [...(state.communityRooms || []), room],
      roomMemberships: [...(state.roomMemberships || []), room.id] };
  }
  const field = { membership: 'roomMemberships', follow: 'following', vote: 'postVotes' }[path];
  if (!field) throw new Error('This feature needs the signed-in app. Open it from your profile.');
  const values = (state[field] || []).filter(id => id !== body.target);
  return { ...state, [field]: body.active ? [...values, body.target] : values };
}
