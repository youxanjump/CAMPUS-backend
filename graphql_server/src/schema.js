const { gql } = require('apollo-server');

const typeDefs = gql`
  # schema definition
  scalar JSON

  type Query {
    tagRenderList: [Tag]
    tagDetail(id: ID!): TagDetail
    missionList: [Mission]
    findingList: [Finding]
  }

  type Tag {
    id: ID!
    title: String
    accessibility: Float
    mission: Mission
    findings: [Finding]
    coordinates: String
    tagDetail: TagDetail
  }

  type TagDetail {
    tagID: ID!
    createTime: String
    lastUpdateTime: String
    createUser: User
    location: Location
    description: String
    imageUrl: [String]
  }

  type User{
    id: ID!
    name: String
  }

  type Location {
      geoInfo: JSON # import json type
  }

  type Mission {
      id: ID!
      name: String
      findings: [Finding]
  }

  type Finding {
      id: ID!
      missionID: String
      name: String
  }
`;

module.exports = typeDefs;
