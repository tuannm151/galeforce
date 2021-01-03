const chai = require('chai');
const nock = require('nock');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const expect = chai.expect;

const RiotAPIModule = require('../dist/riot-api').default;
const { ENDPOINTS, Region } = require('../dist/riot-api');

const v4SummonerByNameReply = { // Taken from Riot Games on 2021/01/02 21:34 GMT-8
    "id": "l3ZbR4AKKKK47w170ZOqcu7kmSV2qb38RV7zK_4n1GucI0w",
    "accountId": "xG5uPpEaSFc8LvOmi4wIumQZHbTlI6WJqECcgsW-_qu_BG4",
    "puuid": "jkxCVExyvEawqoKz-BfIgcvOyT4z8YbYmRSISvxObtrq-JAfX8mCJ4OpEvQ_b9aHJRLZ-NNIfhHr8g",
    "name": "SSG Xayah",
    "profileIconId": 4851,
    "revisionDate": 1609317629000,
    "summonerLevel": 138
};

const dataDragonGameTypesReply = [
    {
        "gametype": "CUSTOM_GAME",
        "description": "Custom games"
    },
    {
        "gametype": "TUTORIAL_GAME",
        "description": "Tutorial games"
    },
    {
        "gametype": "MATCHED_GAME",
        "description": "all other games"
    }
]
const na1API = nock('https://na1.api.riotgames.com')
    .get('/lol/summoner/v4/summoner/by-name/SSG Xayah')
    .reply(200, v4SummonerByNameReply);

const dataDragon = nock('http://static.developer.riotgames.com')
    .get('/docs/lol/gameTypes.json')
    .reply(200, dataDragonGameTypesReply);

const RiotAPI = new RiotAPIModule('RIOT-API-KEY');

describe('/riot-api', () => {
    it('should initialize correctly', () => {
        expect(RiotAPI['key']).to.equal('RIOT-API-KEY');
    });
    describe('URL generation', () => {
        it('should generate correct RiotAPI.request URLs from template strings', () => {
            expect(RiotAPI.request(ENDPOINTS.SUMMONER.SUMMONER_NAME, { server: Region.NORTH_AMERICA, 'summoner-name': 'TEST' })['targetURL'])
                .to.equal('https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/TEST')
        });
        it('should generate correct RiotAPI.dataDragonRequest URLs from teplate strings', () => {
            expect(RiotAPI.dataDragonRequest(ENDPOINTS.DATA_DRAGON.CHAMPION, '10.25.1')['targetURL'])
                .to.equal('http://ddragon.leagueoflegends.com/cdn/10.25.1/data/en_US/champion.json')
        });
    });
    describe('API calls', () => {
        it('should return correct JSON for the /v4/summoners/by-name Riot API endpoint', async () => {
            expect(RiotAPI.request(ENDPOINTS.SUMMONER.SUMMONER_NAME, { server: Region.NORTH_AMERICA, 'summoner-name': 'TEST' }).get())
                .to.eventually.have.property('data').to.equal(v4SummonerByNameReply);
        });
        it('should return correct JSON for the /docs/lol/gameTypes.json Data Dragon endpoint', async () => {
            expect(RiotAPI.dataDragonRequest(ENDPOINTS.DATA_DRAGON.CHAMPION, '10.25.1').get())
                .to.eventually.have.property('data').to.equal(dataDragonGameTypesReply);
        })
    });
});