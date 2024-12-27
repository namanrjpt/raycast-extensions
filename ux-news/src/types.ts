import Parser from "rss-parser";

// export enum Topic {
//   Active = "active",
//   AskHN = "ask",
//   Best = "best",
//   BestComments = "bestcomments",
//   Classic = "classic",
//   FrontPage = "frontpage",
//   Invited = "invited",
//   Jobs = "jobs",
//   Launches = "launches",
//   NewComments = "newcomments",
//   Newest = "newest",
//   Polls = "polls",
//   Pool = "pool",
//   ShowHN = "show",
//   WhoIsHiring = "whoishiring",
// }

export enum Topic {
  'Smashing Magazine' = 'Smashing Magazine',
  'UX Design' = 'UX Design',
  'NN Group' = 'NN Group'
}

export type CacheEntry = {
  timestamp: number;
  items: Parser.Item[];
};
