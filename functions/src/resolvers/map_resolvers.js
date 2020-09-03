const tagResolvers = {
  Tag: {
    tagDetail: async (tag, _, { dataSources }) =>
      dataSources.firebaseAPI.getTagDetail({ tagID: tag.id }),
  },
};

const tagdetailResolvers = {
  TagDetail: {
    createTime: async (tagDetail, _, __) =>
      tagDetail.createTime.toDate().toString(),
    lastUpdateTime: async (tagDetail, _, __) =>
      tagDetail.lastUpdateTime.toDate().toString(),
    createUser: async (tagDetail, _, __) => tagDetail.createUserID,
  },
};

const statusResolvers = {
  Status: {
    createTime: async (status, _, __) => status.createTime.toDate().toString(),
  },
};

const userResolvers = {
  User: {
    uid: async ({ uid }, _, __) => uid,
    displayName: async ({ uid }, _, { dataSources }) =>
      dataSources.firebaseAPI.getUserName({ uid }),
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
  tagdetailResolvers,
  statusResolvers,
  userResolvers,
  missionResolver,
  discoveryResolvers,
  coordinateResolvers,
};
