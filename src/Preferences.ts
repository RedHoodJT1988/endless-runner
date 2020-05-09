namespace RunGoblinRun {
  export class Preferences {

    private static _instance: Preferences = null;

    public record: number = 0;
    public sound: boolean = true;

    // -------------------------------------------------------------------------
    public static get instance(): Preferences {
        if (Preferences._instance === null) {
            Preferences._instance = new Preferences();
        }

        return Preferences._instance;
    }

    // -------------------------------------------------------------------------
    public load(): void {

        if (this.localStorageSupported()) {
            let dataString = localStorage.getItem("goblinrun_save");

            // no saved data?
            if (dataString === null || dataString === undefined) {
                console.log("No saved settings");
                return;

            } else {
                console.log("loading settings: " + dataString);

                // fill settings with data from loaded object
                let data = JSON.parse(dataString);
                // record
                this.record = data.record;
                // sound
                this.sound = data.sound;
            }
        }
    }

    // -------------------------------------------------------------------------
    public save(): void {

        if (this.localStorageSupported()) {

            let dataString = JSON.stringify(this);

            console.log("saving settings: " + dataString);

            localStorage.setItem("goblinrun_save", dataString);
        }
    }

    // -------------------------------------------------------------------------
    private localStorageSupported(): boolean {
        try {
            return "localStorage" in window && window["localStorage"] !== null;
        } catch (e) {
            return false;
        }
    }
}
}