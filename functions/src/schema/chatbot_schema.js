// schema define about chatbot

// Query

const Intent = `type Intent {
  user_intent: String
  user_answer: String
  quentions: [Question]
}`;

const Question = `type Question {
  user_question: String
}
`;

// mutation

module.exports = {
  Intent,
  Question,
};
