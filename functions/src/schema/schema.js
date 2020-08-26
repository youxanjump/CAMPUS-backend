const { gql } = require('apollo-server');

const {
  Tag,
  Category,
  TagDetail,
  Status,
  User,
  Coordinate,
  StreetView,
  Mission,
  Discovery,
  AddNewTagResponse,
  TagUpdateInput,
  AddNewTagDataInput,
  CoordinateInput,
  CategoryInput,
  StreetViewInput,
} = require('./map_schema');

const Query = `type Query {
  tagRenderList: [Tag]
  tag(id: ID!): Tag
  tagDetail(id: ID!): TagDetail
  missionList: [Mission]
  discoveryList: [Discovery]
}`;

const Mutation = `type Mutation {
  #tagUpdate(data: TagUpdateInput!): TagUpdateResponse!
  #tagImageUrlAdd(id: ID, imageUrl: [String]!): TagDetail!
  addNewTagData(data: AddNewTagDataInput!): AddNewTagResponse
  updateTagStatus(tagId: ID!, statusName: String!): Status!
}`;

const typeDefs = gql(
  Query.concat(`
    \n${Tag}
    \n${Category}
    \n${TagDetail}
    \n${Status}
    \n${User}
    \n${Coordinate}
    \n${StreetView}
    \n${Mission}
    \n${Discovery}
    \n${Mutation}
    \n${AddNewTagResponse}
    \n${TagUpdateInput}
    \n${AddNewTagDataInput}
    \n${CoordinateInput}
    \n${CategoryInput}
    \n${StreetViewInput}`)
);

module.exports = typeDefs;
