// import $ = require("jquery");
declare var $: any;

var stuff = []



class Variant {

    variant: string;
    hgvsGVariant: string;
    chr: string;
    gene: string;
    HGVSc: string;
    HGVSg: string;
    HGVSp: string;
    refSeq: string;
    assembly: string;
    varDepth: string;
    varFreq: string;
    varcaller: string;

    constructor(data) {
        this.gene = data.vcf.info.gene || "";
        if (!this.gene) throw new RangeError("No Gene");


// console.log(data.vcf.info);
        this.variant = data.variant;
        this.hgvsGVariant = data.hgvsGVariant;
        this.chr = data.vcf.variantCall.chromosome;

        this.HGVSc = data.vcf.info.HGVSc;
        this.HGVSg = data.vcf.info.HGVSg;
        this.HGVSp = data.vcf.info.HGVSp;

        this.refSeq = data.sourceResults.Mutalyzer.refSeq;
        this.assembly = data.sourceResults.Mutalyzer.assembly;
        this.varDepth = data.domainModel.derived.varDepth;
        this.varFreq = data.domainModel.derived.varFreq;
        this.varcaller = data.domainModel.derived.varcaller;
    }



//		this.lol = data.;
//        {
//            variant: v.variant,
//                hgvsGVariant: v.hgvsGVariant,
//            chr: v.vcf.variantCall.chromosome
//        }

}

var variants = [];
const columnNames = ['variant', 'hgvsGVariant', 'chr', 'gene', 'HGVSc', 'HGVSg', 'HGVSp', 'refSeq', 'assembly', 'varDepth', 'varFreq', 'varcaller'];
//const columns = columnNames.map( function(d){return { data: d, name: d, title: d}});

const columns = columnNames.map( d => ({ data: d, name: d, title: d}));


$.ajax("/08007755.json", {
    success: function(d){
        console.log(d);
        stuff = d;

        Object.keys(d.okResults).forEach(function(hgvsg){
            try {
                const v = new Variant(d.okResults[hgvsg]);
                variants.push(v);
            } catch (e) {
                if(e.message === 'No Gene') {
                    // console.log("Variant had no gene. This is fine.");
                } else {
                    console.error(e);
                }
            }
        });

        $("#myTable").DataTable({
            pageLength: 50,
            data: variants,
            columns: columns
        })

    }
});





