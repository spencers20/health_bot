use('petrolstation')
// db.createCollection()

// db.data.find()

const sale={
    userid:12345,
    sales:[ 
        {
            fuel:[
                {
                    dieselid:'123d',
                    diesel:2
                },
                {
                    petrolid:'123p',
                    petrol:
                },
                {
                    vpowerid:'123vp',
                    vpower:5
                },
                {
                    
                }
            ]
            ,

            others:[
                {
                    tyreid:'1245t',
                    tyres:

                },
                {
                    spannerid:'1245sp',
                    spanners:12
                }

            ]
        }

    ]
   
}

const response=db.sales.insertOne(sale)

if (response.acknowledged){
   db.sales.find()
    
}

