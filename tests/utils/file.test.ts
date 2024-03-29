import * as file from "../../src/utils/file";

describe("file", () => {
    it("should return a random file from dir", () => {
        return file.getRandomFileFromDir("src/services").then(data => {
            expect(typeof data).toBe("string");
            expect(data.length).toBeGreaterThan(0);
        });
    });
    it("should throw an error", () => {
        expect.assertions(1);
        return file.getRandomFileFromDir("src/notExistingFolder").catch(e =>
            expect(e).toMatchObject({
                code: "ENOENT",
                errno: expect.any(Number),
                path: expect.stringMatching(/.*src([\/,\\]{1,2})notExistingFolder/i),
                syscall: "scandir"
            })
        );
    });
});
