let fs = require('fs');

function SimpleCSVFile() {

    //Public functions and data go into public object

    let public = {};
    
    public.headings = {};
    public.rows = {};
    public.title = '';

    public.Reset = function () {
        this.headings = [];
        this.rows = [];
    };

    public.WriteFile = function (name) {
        let file = '';        
        let line = '';

        if(public.title.length !== 0) {
            file += public.title+'\n';
        }

        this.headings.forEach((heading) => {
            line += heading + ',';
        });
        file += line + '\n';
        this.rows.forEach((row) => {
            line = '';
            row.forEach((element) => {
                line += element + ',';
            });
            file += line + '\n';
        });
        
        fs.writeFileSync(name, file);
    };   

    public.Reset();
    return public;
}

module.exports = SimpleCSVFile;