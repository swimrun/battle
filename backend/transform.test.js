const { transformTeamData } = require('./server');

describe('Team Data Transformation', () => {
    test('should correctly transform Backwaterman Knights data', () => {
        const input = [
            ['Backwaterman Knights', '5', '8,0', '40', '14']
        ];
        
        const expected = [{
            teamName: 'Backwaterman Knights',
            numberOfMembers: 5,
            kmPerPerson: 8.0,
            totalKm: 40,
            place: 14
        }];

        const result = transformTeamData(input);
        expect(result).toEqual(expected);
    });

    test('should handle team with zero kilometers', () => {
        const input = [
            ['Nordheide Amphibien', '6', '0,0', '0', '20']
        ];
        
        const expected = [{
            teamName: 'Nordheide Amphibien',
            numberOfMembers: 6,
            kmPerPerson: 0,
            totalKm: 0,
            place: 20
        }];

        const result = transformTeamData(input);
        expect(result).toEqual(expected);
    });

    test('should handle team with decimal kilometers', () => {
        const input = [
            ['BROMBACHSEER', '6', '9,1', '54,5', '11']
        ];
        
        const expected = [{
            teamName: 'BROMBACHSEER',
            numberOfMembers: 6,
            kmPerPerson: 9.1,
            totalKm: 54.5,
            place: 11
        }];

        const result = transformTeamData(input);
        expect(result).toEqual(expected);
    });

    test('should handle team with empty values', () => {
        const input = [
            ['Team Name', '', '', '', '']
        ];
        
        const expected = [{
            teamName: 'Team Name',
            numberOfMembers: null,
            kmPerPerson: null,
            totalKm: null,
            place: null
        }];

        const result = transformTeamData(input);
        expect(result).toEqual(expected);
    });

    test('should handle team with first place', () => {
        const input = [
            ['SwimRun Sumin', '9', '19,1', '172', '1']
        ];
        
        const expected = [{
            teamName: 'SwimRun Sumin',
            numberOfMembers: 9,
            kmPerPerson: 19.1,
            totalKm: 172,
            place: 1
        }];

        const result = transformTeamData(input);
        expect(result).toEqual(expected);
    });
}); 