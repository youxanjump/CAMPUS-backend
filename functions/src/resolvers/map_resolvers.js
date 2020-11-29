const tagResolvers = {
  Tag: {
    createTime: async (tag, _, __) => tag.createTime.toDate().toString(),
    lastUpdateTime: async (tag, _, __) =>
      tag.lastUpdateTime.toDate().toString(),
    createUser: async (tag, _, __) => ({
      // TODO: `tag.createUserId` is old field name
      // remove it if we clean the database
      uid: tag.createUserId || tag.createUserID,
    }),
    imageUrl: async (tag, _, { dataSources }) =>
      dataSources.firebaseAPI.getImageUrls({ tagID: tag.id }),
    statusHistory: async (tag, _, { dataSources }) =>
      dataSources.firebaseAPI.getStatusHistory({ tagID: tag.id }),
  },
};

const statusResolvers = {
  Status: {
    createTime: async (status, _, __) => status.createTime.toDate().toString(),
    createUser: async (status, _, __) => ({ uid: status.createUserId }),
  },
};

const userResolvers = {
  User: {
    uid: async ({ uid }, _, __) => uid,
    displayName: async ({ uid }, _, { dataSources }) => {
      const { displayName } = await dataSources.firebaseAPI.getUserName({
        uid,
      });
      return displayName;
    },
    email: async ({ uid }, _, { dataSources }) => {
      const { email } = await dataSources.firebaseAPI.getUserName({ uid });
      return email;
    },
  },
};

const missionResolver = {
  Mission: {
    discoveries: async (mission, _, { dataSources }) =>
      dataSources.firebaseAPI.getDiscoveriesOfAMission({
        missionID: mission.id,
      }),
  },
};

const discoveryResolvers = {
  Discovery: {
    mission: async (discovery, _, { dataSources }) =>
      dataSources.firebaseAPI.getMissionById({ id: discovery.missionID }),
  },
};

const coordinateResolvers = {
  Coordinate: {
    latitude: async (coordinates, _, __) => coordinates.latitude.toString(),
    longitude: async (coordinates, _, __) => coordinates.longitude.toString(),
  },
};

module.exports = {
  tagResolvers,
  statusResolvers,
  userResolvers,
  missionResolver,
  discoveryResolvers,
  coordinateResolvers,
};
