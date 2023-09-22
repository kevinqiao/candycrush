/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * Generated by convex@1.0.3.
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as battle from "../battle";
import type * as events from "../events";
import type * as games from "../games";
import type * as gameService from "../gameService";
import type * as tournaments from "../tournaments";
import type * as tournamentService from "../tournamentService";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  battle: typeof battle;
  events: typeof events;
  games: typeof games;
  gameService: typeof gameService;
  tournaments: typeof tournaments;
  tournamentService: typeof tournamentService;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
