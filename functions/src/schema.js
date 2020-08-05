const { gql } = require('apollo-server');

const typeDefs = gql`
  # schema definition

  type Query {
    tagRenderList: [Tag]
    tag(id: ID!): Tag
    tagDetail(id: ID!): TagDetail
    missionList: [Mission]
    discoveryList: [Discovery]
  }

  type Tag {
    id: ID!
    title: String
    accessibility: Float
    category: Category
    coordinates: Coordinate
    tagDetail: TagDetail
  }

  type Category {
    missionName: String!
    subTypeName: String
    targetName: String
  }

  type TagDetail {
    tagID: ID!
    createTime: String
    lastUpdateTime: String
    createUser: User
    description: String
    imageUrl: [String]
    streetViewInfo: StreetView
  }

  type User {
    id: ID!
    name: String
    email: String
  }

  type Coordinate {
    latitude: String!
    longitude: String!
  }

  type StreetView {
    povHeading: Float!
    povPitch: Float!
    panoID: String!
    latitude: Float!
    longitude: Float!
  }

  type Mission {
    id: ID!
    name: String
    discoveries: [Discovery]
  }

  type Discovery {
    id: ID!
    mission: Mission
    name: String
  }

  # mutation
  type Mutation {
    #tagUpdate(data: TagUpdateInput!): TagUpdateResponse!
    #tagImageUrlAdd(id: ID, imageUrl: [String]!): TagDetail!
    addNewTagData(data: AddNewTagDataInput!): AddNewTagResponse
  }

  type AddNewTagResponse {
    tag: Tag!
    imageNumber: Int!
    imageUploadUrl: [String]!
  }

  # deprecated
  input TagUpdateInput {
    "set null if we want to create new data"
    id: ID
    "true if modifing existing tag; false if creaing new tag"
    modify: Boolean!
    title: String
    accessibility: Float
    coordinates: CoordinateInput
    description: String
  }

  input AddNewTagDataInput {
    title: String
    accessibility: Float
    category: CategoryInput
    coordinates: CoordinateInput
    description: String
    imageNumber: Int
    streetViewInfo: StreetViewInput
  }

  input CoordinateInput {
    latitude: String
    longitude: String
  }

  input CategoryInput {
    missionName: String!
    subTypeName: String
    targetName: String
  }

  input StreetViewInput {
    povHeading: Float!
    povPitch: Float!
    panoID: String!
    latitude: Float!
    longitude: Float!
  }
`;

module.exports = typeDefs;
