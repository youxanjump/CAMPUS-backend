const { gql } = require('apollo-server');

const typeDefs = gql`
  # schema definition
  scalar JSON

  type Query {
    tagRenderList: [Tag]
    tagDetail(id: ID!): TagDetail
    missionList: [Mission]
    discoveryList: [Discovery]
  }

  type Tag {
    id: ID!
    title: String
    accessibility: Float
    mission: Mission
    discoveries: [Discovery]
    coordinates: Coordinate
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

  type Coordinate {
    latitude: String
    longitude: String
  }

  type Mission {
      id: ID!
      name: String
      discoveries: [Discovery]
  }

  type Discovery {
      id: ID!
      missionID: String
      name: String
  }
`;

module.exports = typeDefs;
