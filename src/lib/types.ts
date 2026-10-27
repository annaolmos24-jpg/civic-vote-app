// Subset of the Google Civic Information API v2 response shapes used by the app.

export interface Election {
  id: string;
  name: string;
  electionDay: string;
  ocdDivisionId?: string;
}

export interface SimpleAddress {
  locationName?: string;
  line1?: string;
  line2?: string;
  line3?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export interface PollingLocation {
  address?: SimpleAddress;
  name?: string;
  notes?: string;
  pollingHours?: string;
  voterServices?: string;
  startDate?: string;
  endDate?: string;
  latitude?: number;
  longitude?: number;
}

export interface Channel {
  type: string;
  id: string;
}

export interface Candidate {
  name: string;
  party?: string;
  candidateUrl?: string;
  phone?: string;
  email?: string;
  channels?: Channel[];
}

export interface Contest {
  type?: string;
  office?: string;
  level?: string[];
  district?: { name?: string; scope?: string; id?: string };
  ballotTitle?: string;
  ballotPlacement?: string;
  numberElected?: string;
  numberVotingFor?: string;
  candidates?: Candidate[];
  referendumTitle?: string;
  referendumSubtitle?: string;
  referendumText?: string;
  referendumProStatement?: string;
  referendumConStatement?: string;
  referendumUrl?: string;
  referendumBallotResponses?: string[];
}

export interface ElectionOfficial {
  name?: string;
  title?: string;
  officePhoneNumber?: string;
  faxNumber?: string;
  emailAddress?: string;
}

export interface AdministrationBody {
  name?: string;
  electionInfoUrl?: string;
  electionRegistrationUrl?: string;
  electionRegistrationConfirmationUrl?: string;
  absenteeVotingInfoUrl?: string;
  votingLocationFinderUrl?: string;
  ballotInfoUrl?: string;
  electionRulesUrl?: string;
  hoursOfOperation?: string;
  correspondenceAddress?: SimpleAddress;
  physicalAddress?: SimpleAddress;
  electionOfficials?: ElectionOfficial[];
}

export interface AdministrativeRegion {
  name?: string;
  electionAdministrationBody?: AdministrationBody;
  local_jurisdiction?: AdministrativeRegion;
}

export interface VoterInfo {
  election?: Election;
  normalizedInput?: SimpleAddress;
  pollingLocations?: PollingLocation[];
  earlyVoteSites?: PollingLocation[];
  dropOffLocations?: PollingLocation[];
  contests?: Contest[];
  state?: AdministrativeRegion[];
  mailOnly?: boolean;
  precinctId?: string;
}
