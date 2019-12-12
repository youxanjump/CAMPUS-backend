module.exports = {
  Query: {
    tagRenderList: async (_, __, { dataSources }) =>
      dataSources.firestoreAPI.getTagList(),
    tagDetail: async (_, { id }, { dataSources }) =>
      dataSources.firestoreAPI.getTagDetail({ tagID: id }),
    missionList: async (_, __, { dataSources }) =>
      dataSources.firestoreAPI.getMissionList(),
    findingList: async (_, __, { dataSources }) =>
      dataSources.firestoreAPI.getFindingList(),
  },
  Tag: {
    tagDetail: async (tag, _, { dataSources }) =>
      dataSources.firestoreAPI.getTagDetail({ tagID: tag.id }),
    mission: async (parent, _, { dataSources }) =>
      dataSources.firestoreAPI.getMissionById({ id: parent.missionID }),
    findings: async (parent, _, { dataSources }) =>
      dataSources.firestoreAPI.getFindingsById({ id: parent.findingIDs }),
  },
  Mission: {
    findings: async (mission, _, { dataSources }) =>
      dataSources.firestoreAPI.getTagDetail({ missionID: mission.id }),
  },
};
