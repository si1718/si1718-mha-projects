describe('Data is loaded', function(){
    it('Should show a list of more than two contacts', function(){
        browser.get("http://localhost:8080");
        var projects = element.all(by.repeater('project in projects'));
        expect(projects.count()).toBeGreaterThan(0);
    })
})